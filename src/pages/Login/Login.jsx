import React, { useEffect, useState } from 'react'
import './Login.scss'
import { useDispatch } from 'react-redux'
import { signinUser } from '../../features/auth/authSlice'
import Button from '../../components/common/Button/Button'
import { LogoIcon, ResetIcon } from '../../elements/icons/icons'
import LoginFooter from '../LoginFooter/LoginFooter'
import { setDisplayNotificationBar } from '../../features/notificationBar/notificationBarSlice'
import { validateEmail } from '../../utils/local'

const Login = () => {
  const dispatch = useDispatch()
  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const handleSubmitLogin = () => {
    const { email, password } = form
    const checkEmail = validateEmail(email)
    if (!checkEmail) {
      dispatch(
        setDisplayNotificationBar('Please input correct email address')
      )
    }
    if (!password) {
      dispatch(
        setDisplayNotificationBar('Please enter correct credentails')
      )
    }

    checkEmail && password && dispatch(signinUser(form))
  }

  useEffect(() => {}, [form])

  const setFormHendler = (e) => {
    setForm((prevForm) => ({
      ...prevForm,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <>
      <div className='login'>
        <div className='logo'>
          <LogoIcon width='75px' />
        </div>
        <div className='login_form'>
          <div className='login_input'>
            <input
              type='text'
              name='email'
              placeholder='email'
              onChange={setFormHendler}
              value={form.email}
            />
            <input
              type='password'
              name='password'
              placeholder='password'
              onChange={setFormHendler}
              value={form.password}
            />
          </div>
          <div className='login_form_reset'>
            <p className='reset-password-text'>Reset password</p>
            <Button
              className='btnFormSubmitLogin'
              onClick={handleSubmitLogin}
              icon={<ResetIcon />}
            />
          </div>
        </div>
      </div>
      <LoginFooter />
    </>
  )
}

export default Login
