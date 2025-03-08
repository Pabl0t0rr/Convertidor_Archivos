/**
 * Utilidades para el conversor de archivos
 */

// Función para mostrar mensajes de estado
function showStatus(message, type) {
    const statusElement = document.getElementById("status")
    statusElement.textContent = message
  
    // Eliminar clases anteriores
    statusElement.classList.remove("status-success", "status-error", "status-progress")
  
    // Añadir la clase correspondiente
    if (type) {
      statusElement.classList.add(`status-${type}`)
    }
  
    statusElement.style.display = "block"
  }
  
  // Función para ocultar el mensaje de estado
  function hideStatus() {
    const statusElement = document.getElementById("status")
    statusElement.style.display = "none"
  }
  
  // Función para actualizar la barra de progreso
  function updateProgress(percent) {
    const progressContainer = document.getElementById("progressContainer")
    const progressBar = document.getElementById("progressBar")
  
    progressContainer.style.display = "block"
    progressBar.style.width = `${percent}%`
  
    if (percent >= 100) {
      setTimeout(() => {
        progressContainer.style.display = "none"
        progressBar.style.width = "0%"
      }, 1000)
    }
  }
  
  // Función para descargar un archivo
  function downloadFile(blob, fileName) {
    // Check if saveAs is available (likely from FileSaver.js)
    if (typeof saveAs !== "undefined") {
      saveAs(blob, fileName)
    } else {
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
    }
  }
  
  // Función para obtener la extensión de un archivo
  function getFileExtension(fileName) {
    return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2)
  }
  
  // Función para cambiar la extensión de un archivo
  function changeFileExtension(fileName, newExtension) {
    const lastDotIndex = fileName.lastIndexOf(".")
    if (lastDotIndex === -1) return `${fileName}.${newExtension}`
    return `${fileName.substring(0, lastDotIndex)}.${newExtension}`
  }
  
  // Función para leer un archivo como ArrayBuffer
  function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }
  
  