import { Link } from 'react-router-dom';
import { Menu, X, SwatchBook as SwapIcon } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-600 rounded-lg">
                                <SwapIcon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                SkillSwap
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/marketplace" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Marketplace</Link>
                        <Link to="/matches" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">AI Matches</Link>
                        <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Dashboard</Link>
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-medium">Login</Link>
                            <Link to="/signup" className="px-5 py-2.5 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-md">
                                Get Started
                            </Link>
                        </div>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 p-2">
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-b border-slate-200 py-4 px-4 space-y-4 animate-in fade-in slide-in-from-top-4">
                    <Link to="/marketplace" className="block text-slate-600 font-medium">Marketplace</Link>
                    <Link to="/matches" className="block text-slate-600 font-medium">AI Matches</Link>
                    <Link to="/dashboard" className="block text-slate-600 font-medium">Dashboard</Link>
                    <hr className="border-slate-100" />
                    <Link to="/login" className="block text-slate-600 font-medium">Login</Link>
                    <Link to="/signup" className="block w-full py-3 bg-indigo-600 text-white text-center rounded-xl font-semibold">Sign Up</Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
