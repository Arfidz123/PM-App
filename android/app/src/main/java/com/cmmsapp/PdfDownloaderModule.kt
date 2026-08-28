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

class PdfDownloaderModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "PdfDownloader"
    }

    @ReactMethod
    fun saveToDownloads(filePath: String, fileName: String, promise: Promise) {
        try {
            val cleanPath = filePath.replace("file://", "")
            val sourceFile = File(cleanPath)
            if (!sourceFile.exists()) {
                promise.reject("FILE_NOT_FOUND", "Source file does not exist: $cleanPath")
                return
            }

            var finalUri: Uri? = null
            val pdfFileName = if (fileName.endsWith(".pdf")) fileName else "$fileName.pdf"

            try {
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
                    val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
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
            } catch (copyErr: Exception) {
                copyErr.printStackTrace()
            }

            // Automatically open intent to view/open PDF
            try {
                openPdfIntent(sourceFile, finalUri)
            } catch (openErr: Exception) {
                openErr.printStackTrace()
            }

            promise.resolve(finalUri?.toString() ?: sourceFile.absolutePath)
        } catch (e: Exception) {
            promise.resolve(filePath)
        }
    }

    @ReactMethod
    fun sharePdf(filePath: String, title: String, message: String, promise: Promise) {
        try {
            val cleanPath = filePath.replace("file://", "")
            val sourceFile = File(cleanPath)
            if (!sourceFile.exists()) {
                promise.reject("FILE_NOT_FOUND", "Source file does not exist: $cleanPath")
                return
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
            promise.reject("ERROR", e.message, e)
        }
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
