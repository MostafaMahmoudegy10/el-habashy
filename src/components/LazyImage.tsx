import { useState } from "react";
import type { ImgHTMLAttributes } from "react";

type LazyImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  eager?: boolean;
  wrapperClassName?: string;
};

export function LazyImage({
  eager = false,
  wrapperClassName = "",
  className = "",
  onLoad,
  ...props
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className={`relative block overflow-hidden bg-slate-100 ${wrapperClassName}`}>
      {!loaded ? (
        <span className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-100 via-white to-slate-200" />
      ) : null}
      <img
        {...props}
        loading={eager ? "eager" : props.loading ?? "lazy"}
        decoding={props.decoding ?? "async"}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        className={`transition duration-700 ${
          loaded ? "scale-100 opacity-100 blur-0" : "scale-[1.02] opacity-0 blur-sm"
        } ${className}`}
      />
    </span>
  );
}
