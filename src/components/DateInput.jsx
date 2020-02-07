import * as React from "react";
import { Datepicker } from "baseui/datepicker";
import ru from "date-fns/locale/ru";

export default ({ onDateChange }) => {
  const [singleDate, setSingleDate] = React.useState(Date.now());
  return (
    <Datepicker
      locale={ru}
      formatString={"dd.MM.yyyy"}
      value={singleDate}
      onChange={({ date }) => {
        setSingleDate(date);
        onDateChange(date);
      }}
    />
  );
};
