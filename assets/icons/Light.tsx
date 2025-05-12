import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg";

const Light = (props: SvgProps) => {
    const strokeWidth = props.strokeWidth || 2; // Default to 2 if not provided
    return (
        <Svg viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none" {...props}>
            <Path d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z" stroke="currentColor" strokeWidth={strokeWidth} />
            <Path d="M11.9955 3H12.0045M11.9961 21H12.0051M18.3588 5.63599H18.3678M5.63409 18.364H5.64307M5.63409 5.63647H5.64307M18.3582 18.3645H18.3672M20.991 12.0006H21M3 12.0006H3.00898" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
};

export default Light;