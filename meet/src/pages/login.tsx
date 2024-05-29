import React, { FC } from "react"
import { Box, Container, Wrapper } from "src/frontend/components"
import { globalSCSS } from "./_app"
import styles from "src/frontend/styles/auth.module.scss"

const Login: FC = () => {
  return (
    <Container className={styles.container} global={globalSCSS.container}>
      <Wrapper className={styles.wrapper} global={globalSCSS.wrapper}>
        <Box className={styles.box} global={globalSCSS.box}></Box>
      </Wrapper>
    </Container>
  )
}

export default Login
