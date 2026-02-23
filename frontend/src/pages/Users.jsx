import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    age: "",
    gender: "",
    height_m: "",
    experience_level: "",
  });
  const [editingId, setEditingId] = useState(null);

  const load = () => {
    apiGet("/users").then(setUsers);
  };

  useEffect(() => {
    load();
  }, []);

  const createUser = async () => {
    await apiPost("/users", form);
    setForm({ age: "", gender: "", height_m: "", experience_level: "" });
    load();
  };

  const deleteUser = async (id) => {
    await apiDelete(`/users/${id}`);
    load();
  };

  const updateUser = async (id, updated) => {
    await apiPut(`/users/${id}`, updated);
    setEditingId(null);
    load();
  };

  return (
    <div>
      <h1>Users CRUD</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Age"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
        />
        <input
          placeholder="Gender"
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
        />
        <input
          placeholder="Height"
          value={form.height_m}
          onChange={(e) => setForm({ ...form, height_m: Number(e.target.value) })}
        />
        <input
          placeholder="Experience"
          value={form.experience_level}
          onChange={(e) =>
            setForm({ ...form, experience_level: e.target.value })
          }
        />
        <button onClick={createUser}>Create</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Height</th>
            <th>Experience</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <UserRow
              key={u.id_user}
              user={u}
              editingId={editingId}
              setEditingId={setEditingId}
              updateUser={updateUser}
              deleteUser={deleteUser}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserRow({ user, editingId, setEditingId, updateUser, deleteUser }) {
  const [local, setLocal] = useState(user);
  const isEditing = editingId === user.id_user;

  return (
    <tr>
      <td>{user.id_user}</td>

      <td>
        {isEditing ? (
          <input
            value={local.age}
            onChange={(e) =>
              setLocal({ ...local, age: Number(e.target.value) })
            }
          />
        ) : (
          user.age
        )}
      </td>

      <td>
        {isEditing ? (
          <input
            value={local.gender}
            onChange={(e) =>
              setLocal({ ...local, gender: e.target.value })
            }
          />
        ) : (
          user.gender
        )}
      </td>

      <td>
        {isEditing ? (
          <input
            value={local.height_m}
            onChange={(e) =>
              setLocal({ ...local, height_m: Number(e.target.value) })
            }
          />
        ) : (
          user.height_m
        )}
      </td>

      <td>
        {isEditing ? (
          <input
            value={local.experience_level || ""}
            onChange={(e) =>
              setLocal({ ...local, experience_level: e.target.value })
            }
          />
        ) : (
          user.experience_level
        )}
      </td>

      <td>
        {isEditing ? (
          <>
            <button onClick={() => updateUser(user.id_user, local)}>
              Save
            </button>
            <button onClick={() => setEditingId(null)}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => setEditingId(user.id_user)}>Edit</button>
            <button onClick={() => deleteUser(user.id_user)}>Delete</button>
          </>
        )}
      </td>
    </tr>
  );
}