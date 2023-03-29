import { REGISTER_SUCCESS, REGISTER_FAIL } from './type';
import axios from 'axios';
import { setAlert } from './alert';
export const register = (name, email, password) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  console.log('here');
  const body = JSON.stringify({
    name,
    email,
    password,
  });
  console.log(name, email, password);
  try {
    const res = await axios.post('/api/users', body, config);
    console.log(res.data);
    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    console.log(error);
    const err = error.response.data.error;
    if (Array.isArray(err))
      err.forEach((e) => dispatch(setAlert(e.msg, 'danger')));
    else dispatch(setAlert(err, 'danger'));
    dispatch({
      type: REGISTER_FAIL,
    });
  }
};
