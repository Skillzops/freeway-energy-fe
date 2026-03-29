import { Link } from "react-router-dom";
import { TbAlertCircleFilled } from "react-icons/tb";
import { brandAssets } from "@/config/brandConfig";

const PageNotFound = () => {
  const statusCode = 404;
  const title = "Page Not Found";
  const brandLogo = brandAssets.logoFull;
  const brandBg = brandAssets.authBackgrounds.installer;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden px-4 py-16">
      <img
        src={brandBg}
        alt="background"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
      />
      <img src={brandLogo} alt="Logo" className="z-10 w-[120px]" />
      <div className="z-10 w-full max-w-xl rounded-[32px] bg-white/55 px-6 py-10 text-center shadow-[0_24px_80px_rgba(24,121,197,0.14)] backdrop-blur-[10px] sm:px-10">
        <div className="text-center">
            <div className="relative">
              <svg height="0" width="0">
                <defs>
                  <linearGradient
                    id="errorGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      style={{
                        stopColor: "var(--brand-primary)",
                        stopOpacity: 1,
                      }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#473b15", stopOpacity: 1 }}
                    />
                  </linearGradient>
                </defs>
              </svg>

              <TbAlertCircleFilled
                className="mx-auto h-20 w-20"
                style={{
                  fill: "url(#errorGradient)",
                }}
              />
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#12385E] sm:text-5xl">
              {statusCode}
            </h1>
            <h2 className="mt-2 text-3xl font-semibold text-[#174A74]">
              {title}
            </h2>
            <p className="mt-4 text-lg text-center text-[#4D7097]">
              The page{" "}
              <span className="text-primary font-medium">
                {window.location.href}
              </span>{" "}
              could not be found.
            </p>
            <div className="mt-6">
              <Link
                to={"/home"}
                className="inline-flex items-center px-4 py-2 text-base font-medium rounded-md text-white bg-errorGradient hover:bg-inversedErrorGradient transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Go back Home
              </Link>
            </div>
        </div>
      </div>
    </main>
  );
};

export default PageNotFound;
