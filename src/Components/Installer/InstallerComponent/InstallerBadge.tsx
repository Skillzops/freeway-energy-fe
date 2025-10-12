//create me an installer badge component that will be used in the login page

const InstallerBadge = () => {
    return (
        <div className="relative flex items-center justify-center w-full h-[80px] overflow-hidden">
            
            {/* Installer Login Button */}
            <div className="relative z-10 px-3 py-1.5 bg-gradient-to-b from-white/90 to-pink-50/80 rounded-full shadow-lg border border-white/30">
                <span className="text-xs font-bold text-amber-700 tracking-wide">
                    INSTALLER LOGIN
                </span>
            </div>
        </div>
    );
};

export default InstallerBadge;