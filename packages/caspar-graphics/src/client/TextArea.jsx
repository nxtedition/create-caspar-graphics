import styles from './input.module.css'

export const TextArea = ({ id, label, onChange, ...props }) => {
  return (
    <div className={styles.container}>
      <label htmlFor={id}>{label}</label>
      <textarea
        className={styles.textarea}
        rows={3}
        id={id}
        onChange={evt => {
          onChange(evt.target.value)
        }}
        {...props}
      />
    </div>
  )
}
