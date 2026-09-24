package com.cmmsapp

import android.app.DownloadManager
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject

class PdfDownloaderModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "PdfDownloader"
    }

    private fun resolveUrl(inputPath: String): String {
        if (inputPath.startsWith("telegram://")) {
            val fileId = inputPath.removePrefix("telegram://").trim()
            val botToken = "8697587330:AAEzhquov9zrxFQvmIvPhxEchwMpsptp2ZE"
            try {
                val apiUrl = "https://api.telegram.org/bot$botToken/getFile?file_id=$fileId"
                val connection = URL(apiUrl).openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.connectTimeout = 15000
                connection.readTimeout = 15000
                val responseText = connection.inputStream.bufferedReader().use { it.readText() }
                val json = JSONObject(responseText)
                if (json.optBoolean("ok")) {
                    val filePath = json.optJSONObject("result")?.optString("file_path")
                    if (!filePath.isNullOrEmpty()) {
                        return "https://api.telegram.org/file/bot$botToken/$filePath"
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        return inputPath
    }

    private fun downloadRemoteFileToCache(urlStr: String, fileName: String): File? {
        return try {
            val url = URL(urlStr)
            val tempFile = File(reactContext.cacheDir, fileName)
            url.openStream().use { input ->
                FileOutputStream(tempFile).use { output ->
                    input.copyTo(output)
                }
            }
            if (tempFile.exists() && tempFile.length() > 0) tempFile else null
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    @ReactMethod
    fun saveToDownloads(filePath: String, fileName: String, promise: Promise) {
        Thread {
            try {
                val pdfFileName = if (fileName.endsWith(".pdf")) fileName else "$fileName.pdf"
                val resolvedPath = resolveUrl(filePath)

                var sourceFile: File? = null

                if (resolvedPath.startsWith("http://") || resolvedPath.startsWith("https://")) {
                    val downloaded = downloadRemoteFileToCache(
                        resolvedPath,
                        "download_${System.currentTimeMillis()}_$pdfFileName"
                    )
                    if (downloaded != null) {
                        sourceFile = downloaded
                    } else {
                        // Fallback to DownloadManager
                        try {
                            val downloadManager =
                                reactContext.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
                            val request = DownloadManager.Request(Uri.parse(resolvedPath)).apply {
                                setTitle(pdfFileName)
                                setDescription("Mengunduh Laporan PM")
                                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                                setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, pdfFileName)
                                setMimeType("application/pdf")
                            }
                            downloadManager.enqueue(request)
                            promise.resolve(resolvedPath)
                            return@Thread
                        } catch (dmErr: Exception) {
                            promise.reject(
                                "DOWNLOAD_ERROR",
                                "Gagal mengunduh remote file: ${dmErr.message}",
                                dmErr
                            )
                            return@Thread
                        }
                    }
                } else {
                    val cleanPath = resolvedPath.replace("file://", "")
                    val localFile = File(cleanPath)
                    if (!localFile.exists()) {
                        promise.reject("FILE_NOT_FOUND", "Source file does not exist: $cleanPath")
                        return@Thread
                    }
                    sourceFile = localFile
                }

                var finalUri: Uri? = null

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    val contentValues = ContentValues().apply {
                        put(MediaStore.MediaColumns.DISPLAY_NAME, pdfFileName)
                        put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf")
                        put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                    }

                    val resolver = reactContext.contentResolver
                    val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)

                    if (uri != null) {
                        resolver.openOutputStream(uri)?.use { outputStream ->
                            FileInputStream(sourceFile).use { inputStream ->
                                inputStream.copyTo(outputStream)
                            }
                        }
                        finalUri = uri
                    }
                } else {
                    val downloadsDir =
                        Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                    if (!downloadsDir.exists()) {
                        downloadsDir.mkdirs()
                    }
                    val destFile = File(downloadsDir, pdfFileName)
                    FileInputStream(sourceFile).use { inputStream ->
                        FileOutputStream(destFile).use { outputStream ->
                            inputStream.copyTo(outputStream)
                        }
                    }
                    finalUri = Uri.fromFile(destFile)

                    try {
                        val scanIntent = Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE)
                        scanIntent.data = finalUri
                        reactContext.sendBroadcast(scanIntent)
                    } catch (e: Exception) {
                        // Ignore media scan fallback error
                    }
                }

                // Automatically open intent to view/open PDF
                try {
                    openPdfIntent(sourceFile, finalUri)
                } catch (openErr: Exception) {
                    openErr.printStackTrace()
                }

                promise.resolve(finalUri?.toString() ?: sourceFile.absolutePath)
            } catch (e: Exception) {
                promise.reject("SAVE_ERROR", e.message ?: "Gagal menyimpan file", e)
            }
        }.start()
    }

    @ReactMethod
    fun sharePdf(filePath: String, title: String, message: String, promise: Promise) {
        Thread {
            try {
                val resolvedPath = resolveUrl(filePath)
                var sourceFile: File? = null

                if (resolvedPath.startsWith("http://") || resolvedPath.startsWith("https://")) {
                    val tempName = "share_${System.currentTimeMillis()}.pdf"
                    sourceFile = downloadRemoteFileToCache(resolvedPath, tempName)
                    if (sourceFile == null || !sourceFile.exists()) {
                        promise.reject("DOWNLOAD_ERROR", "Gagal mengunduh file untuk dibagikan")
                        return@Thread
                    }
                } else {
                    val cleanPath = resolvedPath.replace("file://", "")
                    val localFile = File(cleanPath)
                    if (!localFile.exists()) {
                        promise.reject("FILE_NOT_FOUND", "Source file does not exist: $cleanPath")
                        return@Thread
                    }
                    sourceFile = localFile
                }

                val fileUri: Uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    FileProvider.getUriForFile(
                        reactContext,
                        "${reactContext.packageName}.provider",
                        sourceFile
                    )
                } else {
                    Uri.fromFile(sourceFile)
                }

                val shareIntent = Intent(Intent.ACTION_SEND).apply {
                    type = "application/pdf"
                    putExtra(Intent.EXTRA_STREAM, fileUri)
                    if (message.isNotEmpty()) {
                        putExtra(Intent.EXTRA_TEXT, message)
                    }
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                }

                val chooserTitle = if (title.isNotEmpty()) title else "Bagikan Laporan PDF"
                val chooser = Intent.createChooser(shareIntent, chooserTitle)
                chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactContext.startActivity(chooser)

                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("ERROR", e.message ?: "Gagal membagikan PDF", e)
            }
        }.start()
    }

    private fun openPdfIntent(sourceFile: File, contentUri: Uri?) {
        try {
            val intent = Intent(Intent.ACTION_VIEW)
            val uriToOpen = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                FileProvider.getUriForFile(reactContext, "${reactContext.packageName}.provider", sourceFile)
            } else {
                contentUri ?: Uri.fromFile(sourceFile)
            }
            intent.setDataAndType(uriToOpen, "application/pdf")
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

            val chooser = Intent.createChooser(intent, "Buka Laporan PDF")
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactContext.startActivity(chooser)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
