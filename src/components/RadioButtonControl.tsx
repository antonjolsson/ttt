import React, {ReactElement} from "react";
import './RadioButtonControl.css'

export function RadioButtonControl(props: { options: string[], label: string, selected: string,
    onSelect: (option: string) => void, disabled?: boolean } ): ReactElement {
    function getOptionClassName(optionName: string): string {
        return !props.disabled && optionName === props.selected ? 'selected' : 'unselected'
    }

    return <div className={'radio-button-control'}>
        <p className={`control-label ${!!props.disabled && 'disabled'}`}>{props.label}</p>
        <div className={'options'}>
            {props.options.map(option => <span key={option} onClick={(): void => props.onSelect(option)}
               className={`option ${getOptionClassName(option)} ${!!props.disabled && 'disabled'}`}>{option}</span>)}
        </div>
    </div>;
}
