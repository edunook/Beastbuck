export const Switch = ({ checked = false, disabled = false, onChange, ...props }) => {
  return <input
    type="checkbox"
    checked={checked}
    disabled={disabled}
    onChange={onChange}
    {...props}
  />;
};
