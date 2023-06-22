import { useState } from "react";

const Login = ({ logoutUser, loginUser, show, loading, error }) => {
  const [username, setUsername] = useState("testerson");
  const [password, setPassword] = useState("123456");

  if (!show) {
    return null;
  }

  if (loading) return <div>loading..</div>;
  if (error) return <div>{error.message}</div>;
  const loginUserIn = (event) => {
    event.preventDefault();
    loginUser(username, password);
    setUsername("");
    setPassword("");
  };

  return (
    <div>
      <form onSubmit={loginUserIn}>
        <input
          name="username"
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        ></input>
        <input
          value={password}
          name="password"
          type="password"
          onChange={({ target }) => setPassword(target.value)}
        ></input>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

export default Login;
