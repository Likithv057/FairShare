import * as React from "react"
import Svg, { SvgProps, Path,Circle } from "react-native-svg";

const Pie = (props: SvgProps) => (
<Svg viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none" {...props}>
    <Circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width={props.strokeWidth} />
    <Circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width={props.strokeWidth} />
    <Path d="M7 12H2" stroke="currentColor" stroke-width={props.strokeWidth} stroke-linecap="round" />
    <Path d="M12 17L12 22" stroke="currentColor" stroke-width={props.strokeWidth} stroke-linecap="round" stroke-linejoin="round" />
</Svg>
);

export default Pie;