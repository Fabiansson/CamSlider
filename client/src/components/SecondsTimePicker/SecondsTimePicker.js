import React, { Fragment } from "react";
import { TimePicker } from "@material-ui/pickers";

function SecondsTimePicker(props) {

  const hd = (newValue) => {
    props.onChange(newValue);
  };
  return (
    <Fragment>
      <TimePicker
        disabled={props.disabled}
        ampm={false}
        openTo="hours"
        views={["hours", "minutes", "seconds"]}
        format="HH:mm:ss"
        label={props.label}
        value={props.value}
        onChange={hd}
      />
    </Fragment>
  );
}

export default SecondsTimePicker;