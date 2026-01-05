type HeaderBadgeProps = {
  pageName: string;
  image: string;
};

const HeaderBadge = (props: HeaderBadgeProps) => {
  const { pageName, image } = props;
  return (
    <div className="flex items-center justify-between w-full bg-paleGrayGradientLeft mt-6 px-2 md:px-8 h-[100px] md:h-[128px] gap-4">
      <h1 className="text-[32px] text-textLightGrey font-semibold font-secondary">
        {pageName}
      </h1>
      <div className="flex items-center justify-end overflow-hidden">
        <div
          className="w-36 h-24 opacity-20"
          style={{
            backgroundColor: "var(--brand-primary)",
            maskImage: `url(${image})`,
            WebkitMaskImage: `url(${image})`,
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "right center",
            WebkitMaskPosition: "right center",
            maskSize: "contain",
            WebkitMaskSize: "contain",
          }}
          aria-label={`${pageName} Badge`}
          role="img"
        />
      </div>
    </div>
  );
};

export default HeaderBadge;
