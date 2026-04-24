# Technical Specification: Backend Error Handling for Dashboard AI

This document serves as a reference for the Frontend/Dashboard AI to handle error responses from the Ameskara Bed Backend.

## 1. Overview
The backend has been updated to provide **Informative Error Responses** (400 Bad Request) instead of generic error messages. This allows the frontend to pinpoint exactly which fields are missing or invalid.

---

## 2. Error Response Schema (HTTP 400)
When a request fails validation (POST/PUT Products), the server returns a JSON object with the following structure:

```json
{
  "message": "String: Detailed error description in Indonesian",
  "missingFields": ["Array of Strings: Specific field keys that failed validation"]
}
```

### Example Response:
```json
{
  "message": "Data produk tidak lengkap. Field yang wajib diisi: price, variants",
  "missingFields": ["price", "variants"]
}
```

---

## 3. Validation Field Keys
The following keys may appear in the `missingFields` array:

| Key | Description |
|---|---|
| `name` | Product name is empty or missing. |
| `price` | Product base price is missing, null, or empty string (Note: `0` is allowed). |
| `variants` | The `variants` field is missing or sent as an empty JSON array string (`"[]"`). |
| `slug` | Product slug/URL is missing (Only in PUT requests). |

---

## 4. Special Case: Upload Errors
If the error occurs during image processing (Multer/Cloudinary), the response might not include `missingFields` but will always have a descriptive `message`:

- **Multer Error**: `{ "message": "Gagal upload (Multer): [Specific Multer Error]" }`
- **General Error**: `{ "message": "Gagal upload (General): [Specific Error]" }`
- **File Size**: `{ "message": "Ukuran file melebihi batas maksimum 2MB." }`

---

## 5. Instructions for Frontend AI Implementation

### A. Dynamic Form Validation
1. Use the `missingFields` array to dynamically apply error states (e.g., red borders) to form inputs.
2. Map the array values to your state management (e.g., `setErrors(response.data.missingFields)`).

### B. Toast/Alert Display
1. Always display the `message` string as the primary feedback to the user.
2. It is recommended to use a Toast library (like `react-hot-toast`) for the `message`.

### C. Multipart/Form-Data Handling
- Ensure all numeric fields (like `price`) are sent as strings in the `FormData` object.
- Ensure the `variants` object is stringified: `formData.append('variants', JSON.stringify(variantsArray))`.

---
*Reference for AI Dashboard Integration - Version 1.1*
