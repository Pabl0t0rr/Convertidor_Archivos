/**
 * Script principal para el conversor de archivos
 */

// Función para obtener la extensión de un archivo
function getFileExtension(filename) {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
}

// Función para mostrar el estado
function showStatus(message, type) {
  const statusElement = document.getElementById("status")
  statusElement.textContent = message
  statusElement.className = "status " + type // Agrega la clase 'status' y la clase de tipo
  statusElement.style.display = "block"
}

// Función simulada para la conversión de PDF a Word
async function convertPdfToWord(file) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulación de la conversión
      console.log("Convirtiendo PDF a Word:", file.name)
      // Simular la descarga del archivo
      downloadFile("converted.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
      resolve(true)
    }, 1000) // Simula un retraso de 1 segundo
  })
}

// Función simulada para la conversión de Word a PDF
async function convertWordToPdf(file) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulación de la conversión
      console.log("Convirtiendo Word a PDF:", file.name)
      // Simular la descarga del archivo
      downloadFile("converted.pdf", "application/pdf")
      resolve(true)
    }, 1000) // Simula un retraso de 1 segundo
  })
}

// Función para simular la descarga de un archivo
function downloadFile(filename, mimeType) {
  const link = document.createElement("a")
  link.href = URL.createObjectURL(new Blob([""], { type: mimeType }))
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  // Referencias a elementos del DOM
  const fileInput = document.getElementById("fileInput")
  const fileName = document.getElementById("fileName")
  const conversionType = document.getElementById("conversionType")
  const convertButton = document.getElementById("convertButton")
  const fileInputWrapper = document.querySelector(".file-input-wrapper")
  const statusElement = document.getElementById("status")

  // Inicializar el estado
  statusElement.style.display = "none"
  document.getElementById("progressContainer").style.display = "none"

  // Evento para mostrar el nombre del archivo seleccionado
  fileInput.addEventListener("change", (e) => {
    const selectedFile = e.target.files[0]

    if (selectedFile) {
      // Mostrar el nombre del archivo
      fileName.textContent = "Archivo seleccionado: " + selectedFile.name
      fileName.style.display = "block"

      // Ajustar automáticamente el tipo de conversión según la extensión
      const fileExtension = getFileExtension(selectedFile.name).toLowerCase()

      if (fileExtension === "pdf") {
        conversionType.value = "pdf-to-word"
      } else if (fileExtension === "docx" || fileExtension === "doc") {
        conversionType.value = "word-to-pdf"
      }
    } else {
      fileName.style.display = "none"
    }
  })

  // Evento para el botón de conversión
  convertButton.addEventListener("click", async () => {
    const selectedFile = fileInput.files[0]

    if (!selectedFile) {
      showStatus("Por favor, selecciona un archivo primero.", "error")
      return
    }

    const selectedConversion = conversionType.value
    const fileExtension = getFileExtension(selectedFile.name).toLowerCase()

    // Validar que el archivo coincida con el tipo de conversión
    if (selectedConversion === "pdf-to-word" && fileExtension !== "pdf") {
      showStatus("Por favor, selecciona un archivo PDF para esta conversión.", "error")
      return
    }

    if (selectedConversion === "word-to-pdf" && fileExtension !== "docx" && fileExtension !== "doc") {
      showStatus("Por favor, selecciona un archivo DOCX para esta conversión.", "error")
      return
    }

    // Deshabilitar el botón durante la conversión
    convertButton.disabled = true
    convertButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Convirtiendo...'

    try {
      let success = false

      // Realizar la conversión según el tipo seleccionado
      if (selectedConversion === "pdf-to-word") {
        success = await convertPdfToWord(selectedFile)
      } else if (selectedConversion === "word-to-pdf") {
        success = await convertWordToPdf(selectedFile)
      }

      if (success) {
        showStatus("¡Conversión completada! El archivo se ha descargado.", "success")
      }
    } catch (error) {
      console.error("Error durante la conversión:", error)
      showStatus("Ha ocurrido un error durante la conversión: " + error.message, "error")
    } finally {
      // Habilitar el botón nuevamente
      convertButton.disabled = false
      convertButton.innerHTML = '<i class="fas fa-sync-alt"></i> Convertir'
    }
  })

  // Eventos para arrastrar y soltar archivos
  ;["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    fileInputWrapper.addEventListener(eventName, preventDefaults, false)
  })

  function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
  }
  ;["dragenter", "dragover"].forEach((eventName) => {
    fileInputWrapper.addEventListener(eventName, highlight, false)
  })
  ;["dragleave", "drop"].forEach((eventName) => {
    fileInputWrapper.addEventListener(eventName, unhighlight, false)
  })

  function highlight() {
    fileInputWrapper.classList.add("highlight")
    fileInputWrapper.style.borderColor = "#4facfe"
    fileInputWrapper.style.backgroundColor = "rgba(79, 172, 254, 0.05)"
  }

  function unhighlight() {
    fileInputWrapper.classList.remove("highlight")
    fileInputWrapper.style.borderColor = "#ccc"
    fileInputWrapper.style.backgroundColor = ""
  }

  fileInputWrapper.addEventListener("drop", handleDrop, false)

  function handleDrop(e) {
    const dt = e.dataTransfer
    const files = dt.files

    if (files.length) {
      fileInput.files = files
      // Disparar el evento change manualmente
      const event = new Event("change")
      fileInput.dispatchEvent(event)
    }
  }
})

