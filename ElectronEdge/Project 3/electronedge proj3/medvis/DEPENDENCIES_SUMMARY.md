# 📦 MedVision AI - Dependencies & Requirements Summary

## 🐍 Python Requirements

### Minimum Python Version
- **Python 3.8+** (Recommended: Python 3.9 or 3.10)

### Core Dependencies (Production)

#### Web Framework & Server
```
fastapi==0.104.1          # Modern web framework
uvicorn[standard]==0.24.0  # ASGI server with performance extras
python-multipart==0.0.6    # File upload support
```

#### Machine Learning & AI
```
torch==2.1.0              # PyTorch deep learning framework
torchvision==0.16.0       # Computer vision utilities
numpy==1.24.3             # Numerical computing
pillow==10.0.1            # Image processing library
```

#### LLM APIs
```
openai==1.3.0             # OpenAI GPT integration
anthropic==0.7.8          # Anthropic Claude integration
```

#### Image Processing
```
opencv-python==4.8.1.78   # Advanced image processing
```

#### Document Generation
```
reportlab==4.0.4          # PDF report generation
```

#### HTTP & Utilities
```
requests==2.31.0          # HTTP client library
python-dotenv==1.0.0      # Environment variable management
```

#### Security & Authentication (Optional)
```
python-jose[cryptography]==3.3.0  # JWT token handling
passlib[bcrypt]==1.7.4             # Password hashing
aiofiles==23.2.1                   # Async file operations
```

### Development Dependencies

#### Testing
```
pytest==7.4.3            # Testing framework
pytest-asyncio==0.21.1   # Async testing support
httpx==0.25.2            # Async HTTP client for testing
```

#### Code Quality
```
black==23.11.0           # Code formatter
flake8==6.1.0            # Linting
isort==5.12.0            # Import sorting
```

#### Development Tools
```
jupyter==1.0.0          # Interactive notebooks
ipython==8.17.2         # Enhanced Python shell
watchdog==3.0.0         # File system monitoring
```

#### Documentation
```
mkdocs==1.5.3           # Documentation generator
mkdocs-material==9.4.8  # Material theme for docs
```

## 🌐 Frontend Requirements

### No Build Process Required
- Pure HTML5, CSS3, JavaScript (ES6+)
- No Node.js or npm dependencies
- Works directly in modern browsers

### Browser Compatibility
- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

### Frontend Features Used
- CSS Grid & Flexbox
- CSS Custom Properties (Variables)
- Fetch API
- ES6 Modules
- CSS Backdrop Filter (Glassmorphism)

## 🔧 System Requirements

### Operating System
- **Windows**: 10/11
- **macOS**: 10.15+
- **Linux**: Ubuntu 18.04+, CentOS 7+, or equivalent

### Hardware Requirements

#### Minimum
- **CPU**: 2 cores, 2.0 GHz
- **RAM**: 4 GB
- **Storage**: 2 GB free space
- **Network**: Internet connection for LLM APIs

#### Recommended
- **CPU**: 4+ cores, 2.5+ GHz
- **RAM**: 8+ GB
- **Storage**: 5+ GB free space
- **GPU**: CUDA-compatible (optional, for training)

## 📁 File Structure Requirements

### Required Directories
```
backend/
├── static/
│   ├── uploads/     # Image uploads (auto-created)
│   └── reports/     # PDF reports (auto-created)
├── ml/
│   └── dataset/     # Training data (user-provided)
├── services/        # Core services
├── utils/           # Utilities
└── .env            # Environment variables
```

### Required Files
```
backend/
├── simple_app.py           # Main application
├── requirements.txt        # Dependencies
├── .env                   # Environment config
└── setup.py              # Setup script

frontend/
├── index.html             # Main HTML
├── style.css              # Styling
├── script.js              # JavaScript
├── logo.svg               # Logo
└── favicon.svg            # Favicon
```

## 🔑 Environment Variables

### Required (.env file)
```bash
# LLM API Configuration (at least one recommended)
OPENAI_API_KEY=sk-proj-...     # OpenAI GPT API key
ANTHROPIC_API_KEY=sk-ant-...   # Anthropic Claude API key

# Application Configuration
DEBUG=True                      # Development mode
HOST=0.0.0.0                   # Server host
PORT=8000                      # Server port

# Model Configuration
MODEL_PATH=ml/model.pth        # ML model path
CONFIDENCE_THRESHOLD=0.7       # Prediction threshold

# File Upload Configuration
MAX_FILE_SIZE=10485760         # 10MB max file size
ALLOWED_EXTENSIONS=jpg,jpeg,png,bmp,tiff,webp
```

## 🚀 Installation Methods

### Method 1: Automated Installation
```bash
python install.py
```

### Method 2: Manual Installation
```bash
# Install backend
cd backend
pip install -r requirements.txt
python setup.py

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start server
python simple_app.py
```

### Method 3: Development Setup
```bash
# Install with dev dependencies
cd backend
pip install -r requirements-dev.txt

# Setup pre-commit hooks (optional)
black --check .
flake8 .
isort --check-only .
```

## 🧪 Testing Requirements

### API Testing
```bash
cd backend
python test_llm_integration.py    # Test LLM integration
python test_endpoints.py          # Test API endpoints
python test_api.py                # Full system test
```

### Manual Testing
1. Upload test image
2. Verify analysis results
3. Check PDF report generation
4. Test specialist recommendations

## 📊 Performance Considerations

### Memory Usage
- **Base**: ~200MB (FastAPI + basic libraries)
- **With PyTorch**: ~500MB (loaded model)
- **Peak**: ~1GB (during image processing)

### Processing Time
- **Image Upload**: <1 second
- **AI Analysis**: 1-3 seconds
- **LLM Generation**: 2-5 seconds
- **PDF Creation**: <1 second
- **Total**: 4-10 seconds per analysis

### Scalability
- **Concurrent Users**: 10-50 (single instance)
- **Daily Analyses**: 1000+ (with proper caching)
- **Storage Growth**: ~1MB per analysis (images + reports)

## 🔒 Security Requirements

### API Keys
- Store in environment variables only
- Never commit to version control
- Use different keys for dev/prod
- Rotate keys regularly

### File Security
- Validate all uploaded files
- Limit file sizes (10MB default)
- Scan for malicious content
- Auto-cleanup old files

### Network Security
- Use HTTPS in production
- Implement rate limiting
- Add CORS restrictions
- Monitor API usage

## 📈 Monitoring & Logging

### Health Checks
- `/health` endpoint for system status
- API key validation
- Model availability check
- Disk space monitoring

### Logging
- Request/response logging
- Error tracking
- Performance metrics
- API usage statistics

## 🆘 Troubleshooting

### Common Issues
1. **Import Errors**: Check Python version and dependencies
2. **API Failures**: Verify API keys and internet connection
3. **Memory Issues**: Reduce batch size or upgrade RAM
4. **Port Conflicts**: Change PORT in .env file
5. **File Permissions**: Ensure write access to static/ directories

### Debug Mode
```bash
# Enable debug logging
export DEBUG=True

# Verbose output
python -v simple_app.py

# Check system status
curl http://localhost:8000/health
```

---

## ✅ Quick Checklist

- [ ] Python 3.8+ installed
- [ ] All dependencies installed (`pip install -r requirements.txt`)
- [ ] Environment variables configured (`.env` file)
- [ ] Required directories created
- [ ] API keys added (optional but recommended)
- [ ] Server starts without errors
- [ ] Frontend accessible at http://localhost:8000
- [ ] Health check passes
- [ ] Test analysis completes successfully

**Your MedVision AI system is ready! 🏥🚀**