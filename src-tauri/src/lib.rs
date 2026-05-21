use std::fs;
use base64::{engine::general_purpose, Engine as _};

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_file_bytes(path: String, data: String) -> Result<(), String> {
    let bytes = general_purpose::STANDARD
        .decode(&data)
        .map_err(|e| e.to_string())?;
    fs::write(&path, bytes).map_err(|e| e.to_string())
}

#[tauri::command]
fn read_image_as_data_url(path: String) -> Result<String, String> {
    let bytes = fs::read(&path).map_err(|e| e.to_string())?;
    let lower = path.to_lowercase();
    let mime = if lower.ends_with(".png") { "image/png" }
        else if lower.ends_with(".jpg") || lower.ends_with(".jpeg") { "image/jpeg" }
        else if lower.ends_with(".gif") { "image/gif" }
        else if lower.ends_with(".webp") { "image/webp" }
        else if lower.ends_with(".svg") { "image/svg+xml" }
        else { "image/png" };
    let b64 = general_purpose::STANDARD.encode(&bytes);
    Ok(format!("data:{};base64,{}", mime, b64))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Disable WebKitGTK GPU compositing on Linux — prevents EGL_BAD_PARAMETER
    // crash on systems where EGL display initialization fails (Wayland/Arch etc.)
    #[cfg(target_os = "linux")]
    {
        std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            read_file, write_file, write_file_bytes, read_image_as_data_url
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
