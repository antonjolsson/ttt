import React, {ReactElement} from "react";
import './Footer.css'

export function Footer(): ReactElement {
    return <div id={'footer'}>
        <a id={'source-link'} href={'https://github.com/antonjolsson/tic-tac-toe'}>Source on GitHub</a>
    </div>;
}
