import React from 'react'
import styles from './Skeleton.module.css'

export default function Skeleton({ height = 60, borderRadius = 8 }) {
  return (
    <div
      className={styles.skeleton}
      style={{ height, borderRadius }}
      aria-hidden="true"
    />
  )
}
