#!/usr/bin/env python3
"""
MedVision AI - Complete Installation Script
Handles both backend and frontend setup
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def print_header():
    """Print installation header"""
    print("🏥 MedVision AI - Complete Installation")
    print("=" * 50)
    print(f"Python: {sys.version}")
    print(f"Platform: {platform.system()} {platform.release()}")
    print(f"Architecture: {platform.machine()}")
    print("=" * 50)

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        print(f"   Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    return True

def install_backend():
    """Install backend dependencies"""
    print("\n📦 Installing Backend Dependencies...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return False
    
    os.chdir(backend_dir)
    
    try:
        # Install requirements
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ])
        print("✅ Backend dependencies installed")
        
        # Run backend setup
        subprocess.check_call([sys.executable, "setup.py"])
        print("✅ Backend setup completed")
        
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Backend installation failed: {e}")
        return False
    finally:
        os.chdir("..")

def setup_frontend():
    """Setup frontend files"""
    print("\n🎨 Setting up Frontend...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    # Check if required files exist
    required_files = ["index.html", "style.css", "script.js", "logo.svg", "favicon.svg"]
    missing_files = []
    
    for file in required_files:
        if not (frontend_dir / file).exists():
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Missing frontend files: {', '.join(missing_files)}")
        return False
    
    print("✅ Frontend files verified")
    return True

def create_launch_script():
    """Create a launch script for easy startup"""
    print("\n🚀 Creating Launch Script...")
    
    launch_script = """#!/usr/bin/env python3
\"\"\"
MedVision AI - Launch Script
\"\"\"

import subprocess
import sys
import os
from pathlib import Path

def main():
    print("🏥 Starting MedVision AI...")
    
    # Change to backend directory
    backend_dir = Path(__file__).parent / "backend"
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        sys.exit(1)
    
    os.chdir(backend_dir)
    
    try:
        # Start the server
        print("🚀 Server starting at http://localhost:8000")
        subprocess.run([sys.executable, "simple_app.py"])
    except KeyboardInterrupt:
        print("\\n👋 MedVision AI stopped")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
"""
    
    with open("launch_medvision.py", "w") as f:
        f.write(launch_script)
    
    # Make executable on Unix systems
    if platform.system() != "Windows":
        os.chmod("launch_medvision.py", 0o755)
    
    print("✅ Launch script created: launch_medvision.py")

def main():
    """Main installation function"""
    print_header()
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install backend
    if not install_backend():
        print("\n❌ Backend installation failed")
        sys.exit(1)
    
    # Setup frontend
    if not setup_frontend():
        print("\n❌ Frontend setup failed")
        sys.exit(1)
    
    # Create launch script
    create_launch_script()
    
    print("\n🎉 Installation completed successfully!")
    print("\n📋 Next Steps:")
    print("1. Configure API keys in backend/.env (optional)")
    print("2. Run: python launch_medvision.py")
    print("3. Open: http://localhost:8000")
    print("\n🏥 MedVision AI is ready to use!")

if __name__ == "__main__":
    main()