from flask import Flask, request, jsonify
from pdf2image import convert_from_path
from PIL import Image
import base64
import requests
import os
from flask_cors import CORS
import traceback
from pypdf import PdfReader
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

openai_api_key = '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'

 
@app.route('/text', methods=['POST'])

def text():
    try:
        user_input = request.json.get('text')
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {openai_api_key}"
        }
        response_payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "user", "content": user_input}
            ]
        }
        response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=response_payload)
        print(f"OpenAI API response status: {response.status_code}")
        print(f"OpenAI API response body: {response.text}")
        if response.status_code != 200:
            return jsonify({"error": "Failed to get a response from OpenAI", "details": response.text}), 500
            
            
        return jsonify({"content": response.json()["choices"][0]["message"]["content"]}), 200
    except Exception as e:
        traceback.print_exc()  # Print the stack trace to the console
        return jsonify({"error": str(e)}), 500


@app.route('/uploadFile', methods=['POST'])
 
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        if file:
            # Save the uploaded PDF to a temporary location
            temp_pdf_path = "/tmp/uploaded_resume.pdf"
            file.save(temp_pdf_path)
            
            # Convert PDF to image
            text=""
            reader=PdfReader(temp_pdf_path)
            for i in range(len(reader.pages)):
                text=text+reader.pages[i].extract_text()

            

           
            
             

         
            
            # Create the request payload
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {openai_api_key}"
            }
            response_payload = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "assistant", "content": f"you are my chatbot ,Suggest jobs based on this resume below. {text}..."}
                ]
            }
            
            # Send the request to OpenAI API
            response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=response_payload)
            print(f"OpenAI API response status: {response.status_code}")
            print(f"OpenAI API response body: {response.text}")
            if response.status_code != 200:
                return jsonify({"error": "Failed to get a response from OpenAI", "details": response.text}), 500
            
            return (response.json()["choices"][0]["message"]["content"]), 200
 
    except Exception as e:
        traceback.print_exc()  # Print the stack trace to the console
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=3000, debug=True)
