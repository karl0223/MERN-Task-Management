import { useRef } from "react";
import { useState } from "react";
import { HiMiniPlus } from "react-icons/hi2";

const ocr_api_key = import.meta.env.VITE_OCR_API_KEY;

function OcrSpaceUploader({ setTodoList }) {
  const [ocrResult, setOcrResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

  const fileInputRef = useRef();

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleClearResult = () => {
    setOcrResult("");
  };

  const handleAddTodoTasks = () => {
    try {
      setLoading(true);

      const resultArray = ocrResult
        ?.split("\n")
        .map((line) => line.trim())
        .filter((item) => item !== "");

      setTodoList(resultArray);
    } catch (err) {
      console.error(err);
      setError("Failed to process image handle.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      alert("Unsupported file type. Please upload a JPEG, PNG, or JPG image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Raw = e.target.result.split(",")[1]; // remove data URL prefix
      const mimeType = file.type;
      const base64Image = `data:${mimeType};base64,${base64Raw}`;

      const formData = new URLSearchParams();
      formData.append("base64Image", base64Image);
      formData.append("language", "eng");
      formData.append("isOverlayRequired", "false");

      try {
        setLoading(true);
        setError(null);

        const response = await fetch("https://api.ocr.space/parse/image", {
          method: "POST",
          headers: {
            apikey: ocr_api_key,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        const result = await response.json();

        const text = result.ParsedResults?.[0]?.ParsedText || "No text found.";

        setOcrResult((prev) => {
          if (!prev || prev === "No text found.") {
            return text; // If empty or default, just set new text
          }
          return prev + "\n" + text; // Append new text with newline separator
        });
      } catch (err) {
        console.error(err);
        setError("Failed to process image.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(file); // keep it in-memory

    // ✅ Reset input to allow re-upload of same file
    event.target.value = null;
  };

  return (
    <div>
      <button className="card-btn text-nowrap" onClick={handleClick}>
        <HiMiniPlus className="text-lg" /> Upload Image
      </button>
      <input
        className="hidden"
        type="file"
        accept="image"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      {loading && <p>Processing image...</p>}
      {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

      {ocrResult && (
        <div className="">
          <div className="input-box">
            <pre>{ocrResult}</pre>
          </div>

          {ocrResult.trim() !== "No text found." && (
            <div className="flex justify-end space-x-2">
              <button
                className="card-btn text-nowrap"
                onClick={handleAddTodoTasks}
              >
                <HiMiniPlus className="text-lg" /> Add Tasks
              </button>

              <button
                className="card-btn text-nowrap"
                onClick={handleClearResult}
              >
                <HiMiniPlus className="text-lg" /> Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OcrSpaceUploader;
