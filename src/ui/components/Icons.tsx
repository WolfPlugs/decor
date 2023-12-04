import type { PropsWithChildren, SVGProps } from "react";

interface BaseIconProps extends IconProps {
  viewBox: string;
}

interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string;
  height?: string | number;
  width?: string | number;
}


function Icon({ height = 24, width = 24, className, children, viewBox, ...svgProps }: PropsWithChildren<BaseIconProps>) {
  return (
      <svg
          className={[className, "vc-icon"]}
          role="img"
          width={width}
          height={height}
          viewBox={viewBox}
          {...svgProps}
      >
          {children}
      </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
      <Icon
          {...props}
          className={[props.className, "rp-copy-icon"]}
          viewBox="0 0 24 24"
      >
          <g fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1z" />
              <path d="M15 5H8c-1.1 0-1.99.9-1.99 2L6 21c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V11l-6-6zM8 21V7h6v5h5v9H8z" />
          </g>
      </Icon>
  );
}

export function DeleteIcon(props: IconProps) {
  return (
      <Icon
          {...props}
          className={[props.className, "vc-delete-icon"]}
          viewBox="0 0 24 24"
      >
          <path
              fill="currentColor"
              d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"
          />
          <path
              fill="currentColor"
              d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"
          />
      </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
      <Icon
          {...props}
          className={[props.className, "rp-plus-icon"]}
          viewBox="0 0 18 18"
      >
          <polygon
              fill-rule="nonzero"
              fill="currentColor"
              points="15 10 10 10 10 15 8 15 8 10 3 10 3 8 8 8 8 3 10 3 10 8 15 8"
          />
      </Icon>
  );
}

export function NoEntrySignIcon(props: IconProps) {
  return (
      <Icon
          {...props}
          className={[props.className, "rp-no-entry-sign-icon"]}
          viewBox="0 0 24 24"
      >
          <path
              d="M0 0h24v24H0z"
              fill="none"
          />
          <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"
          />
      </Icon>
  );
}
