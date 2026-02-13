import { Github, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-1">
                        <span className="text-2xl font-bold text-white flex items-center gap-2">
                            SkillSwap
                        </span>
                        <p className="mt-4 text-slate-400 leading-relaxed">
                            Empowering individuals to learn and grow through skills exchange. No costs, just pure knowledge sharing.
                        </p>
                        <div className="flex space-x-5 mt-6">
                            <Twitter className="w-5 h-5 cursor-pointer hover:text-indigo-400" />
                            <Github className="w-5 h-5 cursor-pointer hover:text-indigo-400" />
                            <Linkedin className="w-5 h-5 cursor-pointer hover:text-indigo-400" />
                            <Instagram className="w-5 h-5 cursor-pointer hover:text-indigo-400" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-6">Platform</h3>
                        <ul className="space-y-4">
                            <li><Link to="/marketplace" className="hover:text-indigo-400">Browse Skills</Link></li>
                            <li><Link to="/matches" className="hover:text-indigo-400">AI Matches</Link></li>
                            <li><Link to="/create-skill" className="hover:text-indigo-400">Post a Skill</Link></li>
                            <li><Link to="/dashboard" className="hover:text-indigo-400">Dashboard</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-6">Support</h3>
                        <ul className="space-y-4">
                            <li><a href="#" className="hover:text-indigo-400">Help Center</a></li>
                            <li><a href="#" className="hover:text-indigo-400">Safety Center</a></li>
                            <li><a href="#" className="hover:text-indigo-400">Community Guidelines</a></li>
                            <li><a href="#" className="hover:text-indigo-400">Contact Us</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-6">Legal</h3>
                        <ul className="space-y-4">
                            <li><a href="#" className="hover:text-indigo-400">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-indigo-400">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-indigo-400">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
                    © {new Date().getFullYear()} SkillSwap Inc. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
