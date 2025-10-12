import { Link } from "react-router-dom";
import { TbAlertCircleFilled } from "react-icons/tb";

const PageNotFound = () => {
  const statusCode = 404;
  const title = "Page Not Found";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Error content */}
      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-xl w-full px-4">
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
                      style={{ stopColor: "#982214", stopOpacity: 1 }}
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
            <h1 className="mt-4 text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
              {statusCode}
            </h1>
            <h2 className="mt-2 text-3xl font-semibold text-gray-700">
              {title}
            </h2>
            <p className="mt-4 text-lg text-center text-gray-500">
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
      </div>
    </div>
  );
};

export default PageNotFound;
