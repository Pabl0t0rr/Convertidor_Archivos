/**
 * Módulo para convertir DOCX a PDF
 */

// Declaraciones de variables necesarias
let showStatus = (message, status) => console.log(`${status}: ${message}`);
let updateProgress = (percentage) => console.log(`Progress: ${percentage}%`);
let mammoth = window.mammoth; // Asegúrate de que mammoth.js esté incluido en tu proyecto
let { jsPDF } = window.jspdf; // Asegúrate de que jsPDF esté incluido en tu proyecto

// Función para leer un archivo como ArrayBuffer
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

// Función para cambiar la extensión de un archivo
function changeFileExtension(fileName, newExtension) {
  return fileName.replace(/\.[^/.]+$/, `.${newExtension}`)
}

// Función para descargar el archivo generado
function downloadFile(blob, fileName) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Función principal para convertir DOCX a PDF
async function convertWordToPdf(file) {
  try {
    showStatus("Leyendo el archivo DOCX...", "progress")
    updateProgress(10)

    // Leer el archivo DOCX
    const arrayBuffer = await readFileAsArrayBuffer(file)

    showStatus("Extrayendo contenido...", "progress")
    updateProgress(30)

    // Cargar el documento DOCX con mammoth
    const result = await mammoth.extractRawText({ arrayBuffer })
    const text = result.value

    if (!text) {
      throw new Error("El archivo DOCX está vacío o no se pudo extraer texto.")
    }

    showStatus("Generando archivo PDF...", "progress")
    updateProgress(60)

    // Crear un nuevo documento PDF
    const doc = new jsPDF()

    // Configurar márgenes y tamaño de fuente
    const margin = 15
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2
    const fontSize = 12
    doc.setFontSize(fontSize)

    // Dividir el texto en líneas
    const lines = doc.splitTextToSize(text, pageWidth)

    // Calcular cuántas líneas caben en una página
    const lineHeight = fontSize * 1.2  // Incrementé el interlineado
    const pageHeight = doc.internal.pageSize.getHeight() - margin * 2
    const linesPerPage = Math.floor(pageHeight / lineHeight)

    // Añadir líneas al documento PDF
    let currentPage = 1
    for (let i = 0; i < lines.length; i += linesPerPage) {
      if (i > 0) {
        doc.addPage()
        currentPage++
      }

      const pageLines = lines.slice(i, i + linesPerPage)
      doc.text(pageLines, margin, margin + lineHeight)

      updateProgress(60 + (currentPage / Math.ceil(lines.length / linesPerPage)) * 30)
    }

    updateProgress(90)

    // Generar el archivo PDF
    const pdfBlob = doc.output("blob")

    // Verificar que el PDF no esté vacío
    if (!pdfBlob.size) {
      throw new Error("El archivo PDF está vacío.")
    }

    // Cambiar el nombre del archivo
    const newFileName = changeFileExtension(file.name, "pdf")

    updateProgress(100)
    showStatus("¡Conversión completada!", "success")

    // Descargar el archivo
    downloadFile(pdfBlob, newFileName)

    return true
  } catch (error) {
    console.error("Error al convertir DOCX a PDF:", error)
    showStatus("Error al convertir el archivo: " + error.message, "error")
    updateProgress(0)
    return false
  }
}