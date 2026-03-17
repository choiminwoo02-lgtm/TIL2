# Handwritten Digit Recognition Project

This project provides tools for recognizing handwritten digits (0-9) using machine learning. It includes a web-based interface, a desktop GUI, and a command-line script for training and evaluation.

## Project Overview

- **Core Technology:** Python, scikit-learn (SVM and KNN), Flask, PIL (Pillow), NumPy.
- **Dataset:** Uses the scikit-learn `digits` dataset (8x8 grayscale images).
- **Key Features:**
    - **Advanced Preprocessing:** Cropping and centering of drawn digits for better accuracy.
    - **Interactive Learning (Teaching):** Users can correct the model by providing the correct label for a drawing, which is then added to the training set in real-time.
    - **Web Interface:** A Flask-based web application with an HTML5 canvas.
    - **Desktop GUI:** A Tkinter-based application for drawing and recognition.

## Architecture

- `app.py`: Flask backend server for the web version.
- `mnist_painter.py`: Desktop Tkinter application for drawing and recognizing digits.
- `mnist_recognizer.py`: CLI script to train and evaluate an SVM classifier.
- `templates/index.html`: Frontend for the web application.

## Building and Running

### Prerequisites
- Python 3.x
- Required libraries: `Flask`, `numpy`, `Pillow`, `scikit-learn`, `matplotlib`.
- Installation: `pip install Flask numpy Pillow scikit-learn matplotlib`

### Running the Web Application
```powershell
python app.py
```
Then open `http://127.0.0.1:5000` in your browser.

### Running the Desktop GUI
```powershell
python mnist_painter.py
```

### Running the CLI Evaluator
```powershell
python mnist_recognizer.py
```

## Development Conventions

- **Model Selection:** Uses `KNeighborsClassifier` for the interactive versions to support fast online updates (teaching).
- **Preprocessing:** All drawing inputs are automatically cropped to the bounding box and centered in an 8x8 frame to match the training data format.
- **Language:** All code and comments are in English.
