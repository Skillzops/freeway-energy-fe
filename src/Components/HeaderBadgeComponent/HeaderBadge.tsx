type HeaderBadgeProps = {
  pageName: string;
  image: string;
};

const HeaderBadge = (props: HeaderBadgeProps) => {
  const { pageName, image } = props;
  return (
    <div className="flex items-center justify-between w-full bg-paleGrayGradientLeft px-2 md:px-8 h-[100px] md:h-[128px] gap-4">
      <h1 className="text-[32px] text-textLightGrey font-semibold font-secondary">
        {pageName}
      </h1>
      <div className="flex items-center justify-end h-[100px] md:h-[128px] overflow-hidden">
        <img
          src={image}
          alt={`${pageName} Badge`}
          className="w-full opacity-20"
        />
      </div>
    </div>
  );
};

export default HeaderBadge;
