import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg";

const ArrowUp = (props: SvgProps) => (
    <Svg viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none" {...props}>
    <Path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" stroke-width={props.strokeWidth} />
    <Path d="M17 14C17 14 13.3176 10 12 10C10.6824 9.99999 7 14 7 14" stroke="currentColor" stroke-width={props.strokeWidth} stroke-linecap="round" stroke-linejoin="round" />
    </Svg>
);

export default ArrowUp;
