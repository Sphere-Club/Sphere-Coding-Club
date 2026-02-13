# 🏥 Medical Image Analysis System

Complete AI-powered medical image analysis system with LLM-generated explanations, specialist recommendations, and PDF reports.

## 🚀 Quick Start

### Option 1: One-Click Launch
```bash
python launch.py
```

### Option 2: Manual Setup
```bash
# Install backend dependencies
cd backend
pip install -r requirements.txt

# Start the server
python start.py
```

## 🌐 Access Points

Once running, visit:
- **Test Interface**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📁 Project Structure

```
medical-image-analysis/
├── launch.py                 # One-click launcher
├── README.md                 # This file
│
├── backend/                  # FastAPI backend
│   ├── app.py               # Main API server
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables (API keys)
│   ├── start.py             # Backend launcher
│   ├── test_api.py          # System tests
│   │
│   ├── ml/                  # Machine Learning
│   │   ├── dataset/         # Training images
│   │   ├── preprocessing.py # Image preprocessing
│   │   ├── train.py         # Model training
│   │   └── model.pth        # Trained model
│   │
│   ├── services/            # Business logic
│   │   ├── predictor.py     # Image prediction
│   │   ├── llm_notes.py     # LLM explanations
│   │   ├── specialist.py    # Doctor recommendations
│   │   └── pdf_report.py    # PDF generation
│   │
│   ├── utils/               # Utilities
│   │   ├── image_utils.py   # Image processing
│   │   └── confidence_utils.py # Confidence analysis
│   │
│   └── static/              # Static files
│       ├── uploads/         # Uploaded images
│       └── reports/         # Generated PDFs
│
└── frontend/                # Web interface
    ├── index.html           # Main HTML page
    ├── styles.css           # Styling
    └── script.js            # JavaScript logic
```

## 🔑 Features

### 🤖 AI Analysis
- **Deep Learning**: ResNet18-based CNN for medical image classification
- **Confidence Scoring**: Reliability analysis for predictions
- **Image Validation**: Format and quality checks

### 🧠 LLM Integration
- **OpenAI GPT**: Dynamic disease explanations ✅ **Configured**
- **Anthropic Claude**: Alternative LLM provider
- **Smart Fallback**: Static explanations when APIs unavailable

### 👨‍⚕️ Medical Features
- **Disease Explanations**: Patient-friendly medical information
- **Specialist Finder**: Location-based doctor recommendations
- **PDF Reports**: Comprehensive medical reports
- **Urgency Assessment**: Risk level evaluation

### 🌐 Web Interface
- **Drag & Drop**: Easy image upload
- **Real-time Preview**: Image validation and preview
- **Progress Tracking**: Visual analysis steps
- **Responsive Design**: Works on all devices

## 🧪 Testing the System

### 1. Upload Test Image
- Drag and drop any medical image (JPG, PNG, etc.)
- Or click to browse and select file
- System validates format and size automatically

### 2. Optional Location
- Enter your location for specialist recommendations
- Leave blank to skip specialist finder

### 3. Analyze
- Click "Analyze Image" button
- Watch real-time progress indicators
- View comprehensive results

### 4. Results Include
- **Diagnosis**: Disease classification with confidence
- **Explanation**: LLM-generated medical information
- **Specialists**: Nearby doctors (if location provided)
- **PDF Report**: Downloadable comprehensive report

## ⚙️ Configuration

### API Keys (Already Configured ✅)
- **OpenAI**: Configured and ready for dynamic explanations
- **Anthropic**: Available as backup option

### Environment Variables
Located in `backend/.env`:
```bash
OPENAI_API_KEY=sk-proj-... # ✅ Configured
ANTHROPIC_API_KEY=your_key  # Optional backup
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

## 🔧 Development

### Adding Training Data
1. Place medical images in `backend/ml/dataset/Disease_A/` and `Disease_B/`
2. Run training: `cd backend/ml && python train.py`
3. Model will be saved as `model.pth`

### Testing Components
```bash
# Test entire system
cd backend && python test_api.py

# Test LLM integration
cd backend && python -c "from services.llm_notes import test_llm_integration; test_llm_integration()"

# Test API endpoints
curl http://localhost:8000/health
```

### Customization
- **Add diseases**: Update `predictor.py` and retrain model
- **Modify UI**: Edit `frontend/` files
- **Add LLM providers**: Extend `llm_notes.py`
- **Custom specialists**: Update `specialist.py`

## 🚨 Important Notes

### Medical Disclaimer
This system is for **educational and research purposes only**. Results should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers.

### Security
- Validate all uploaded images
- Use environment variables for API keys
- Implement rate limiting in production
- Add authentication for sensitive deployments

## 📊 System Status

- ✅ **Backend**: FastAPI server with ML pipeline
- ✅ **Frontend**: Modern HTML/CSS/JS interface
- ✅ **LLM Integration**: OpenAI GPT configured
- ✅ **File Processing**: Image validation and preprocessing
- ✅ **PDF Generation**: Comprehensive medical reports
- ✅ **CORS Enabled**: Frontend-backend communication
- ⚠️ **Model Training**: Add your dataset and train

## 🆘 Troubleshooting

### Common Issues

**"API Offline"**
- Check if backend server is running
- Verify port 8000 is available
- Check backend/app.py for errors

**"Missing dependencies"**
- Run: `cd backend && pip install -r requirements.txt`
- Ensure Python 3.8+ is installed

**"LLM API Error"**
- Check API key in backend/.env
- Verify internet connection
- System will use fallback explanations

**"Model not found"**
- Add training images to ml/dataset/
- Run: `cd backend/ml && python train.py`
- Or use system with untrained model (lower accuracy)

### Getting Help
1. Check system status: http://localhost:8000/health
2. Run diagnostics: `cd backend && python test_api.py`
3. Check server logs in terminal
4. Verify all files are present

## 🎯 Next Steps

1. **Add Training Data**: Place medical images in dataset folders
2. **Train Model**: Run training script for better accuracy
3. **Customize Interface**: Modify frontend for your needs
4. **Deploy**: Set up production environment with proper security

---

**Ready to analyze medical images with AI! 🚀**