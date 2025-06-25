import React from 'react';
import clsx from 'clsx';

interface IconProps {
  icon: React.ElementType | string;  // Can be either a component (icon) or a string (image source)
  title?: string;
  color?: string;
  onClick?: () => void;
  className?: string;
  titleClassName?: string;
  iconClassName?: string;
}

const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  title,
  onClick,
  className,
  titleClassName,
  iconClassName,
}) => {

  return (
    <div
      className={clsx('flex items-center cursor-pointer', className)}  // No need for positionClasses anymore
      onClick={onClick}
      role="button"
      aria-label={title || 'icon'}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Check if IconComponent is a string (image path) or a component */}
      {typeof IconComponent === 'string' ? (
        <img
          src={IconComponent}
          alt={title || 'icon image'}
          className={clsx(iconClassName)} // Handle image class styling via iconClassName
        />
      ) : (
        <IconComponent
          className={clsx("text-base", iconClassName)} // Icon component class styling
        />
      )}

      {/* Render title if provided */}
      {title && (
        <span className={clsx(titleClassName)}>
          {title}
        </span>
      )}
    </div>
  );
};

export default Icon;
