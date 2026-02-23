import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../api";

export default function Foods() {
  const [foods, setFoods] = useState([]);
  const [q, setQ] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    food_item: "",
    category: "",
    calories_kcal: "",
    protein_g: "",
    carbohydrates_g: "",
    fat_g: "",
    source: "",
  });

  const load = () => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    qs.set("limit", "200");
    apiGet(`/foods?${qs.toString()}`).then(setFoods);
  };

  useEffect(() => {
    load();
  }, []);

  const createFood = async () => {
    await apiPost("/foods", {
      ...form,
      calories_kcal: form.calories_kcal === "" ? null : Number(form.calories_kcal),
      protein_g: form.protein_g === "" ? null : Number(form.protein_g),
      carbohydrates_g: form.carbohydrates_g === "" ? null : Number(form.carbohydrates_g),
      fat_g: form.fat_g === "" ? null : Number(form.fat_g),
    });
    setForm({
      food_item: "",
      category: "",
      calories_kcal: "",
      protein_g: "",
      carbohydrates_g: "",
      fat_g: "",
      source: "",
    });
    load();
  };

  const deleteFood = async (id) => {
    await apiDelete(`/foods/${id}`);
    load();
  };

  const updateFood = async (id, updated) => {
    await apiPut(`/foods/${id}`, updated);
    setEditingId(null);
    load();
  };

  return (
    <div>
      <h1>Foods CRUD</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          placeholder="Search food_item..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={load}>Search</button>
      </div>

      <div style={{ marginBottom: 20, background: "white", padding: 12 }}>
        <h3>Create food</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            placeholder="food_item *"
            value={form.food_item}
            onChange={(e) => setForm({ ...form, food_item: e.target.value })}
          />
          <input
            placeholder="category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <input
            placeholder="calories_kcal"
            value={form.calories_kcal}
            onChange={(e) => setForm({ ...form, calories_kcal: e.target.value })}
          />
          <input
            placeholder="protein_g"
            value={form.protein_g}
            onChange={(e) => setForm({ ...form, protein_g: e.target.value })}
          />
          <input
            placeholder="carbohydrates_g"
            value={form.carbohydrates_g}
            onChange={(e) =>
              setForm({ ...form, carbohydrates_g: e.target.value })
            }
          />
          <input
            placeholder="fat_g"
            value={form.fat_g}
            onChange={(e) => setForm({ ...form, fat_g: e.target.value })}
          />
          <input
            placeholder="source"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          />
          <button onClick={createFood}>Create</button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Food</th>
            <th>Category</th>
            <th>Calories</th>
            <th>Protein</th>
            <th>Carbs</th>
            <th>Fat</th>
            <th>Source</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((f) => (
            <FoodRow
              key={f.id_food}
              food={f}
              isEditing={editingId === f.id_food}
              onEdit={() => setEditingId(f.id_food)}
              onCancel={() => setEditingId(null)}
              onSave={(updated) => updateFood(f.id_food, updated)}
              onDelete={() => deleteFood(f.id_food)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FoodRow({ food, isEditing, onEdit, onCancel, onSave, onDelete }) {
  const [local, setLocal] = useState(food);

  useEffect(() => setLocal(food), [food]);

  return (
    <tr>
      <td>{food.id_food}</td>

      <td>
        {isEditing ? (
          <input
            value={local.food_item || ""}
            onChange={(e) => setLocal({ ...local, food_item: e.target.value })}
          />
        ) : (
          food.food_item
        )}
      </td>

      <td>
        {isEditing ? (
          <input
            value={local.category || ""}
            onChange={(e) => setLocal({ ...local, category: e.target.value })}
          />
        ) : (
          food.category
        )}
      </td>

      <td>
        {isEditing ? (
          <input
            value={local.calories_kcal ?? ""}
            onChange={(e) =>
              setLocal({
                ...local,
                calories_kcal: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        ) : (
          food.calories_kcal
        )}
      </td>

      <td>
        {isEditing ? (
          <input
            value={local.protein_g ?? ""}
            onChange={(e) =>
              setLocal({
                ...local,
                protein_g: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        ) : (
          food.protein_g
        )}
      </td>

      <td>
        {isEditing ? (
          <input
            value={local.carbohydrates_g ?? ""}
            onChange={(e) =>
              setLocal({
                ...local,
                carbohydrates_g: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        ) : (
          food.carbohydrates_g
        )}
      </td>

      <td>
        {isEditing ? (
          <input
            value={local.fat_g ?? ""}
            onChange={(e) =>
              setLocal({
                ...local,
                fat_g: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        ) : (
          food.fat_g
        )}
      </td>

      <td>
        {isEditing ? (
          <input
            value={local.source || ""}
            onChange={(e) => setLocal({ ...local, source: e.target.value })}
          />
        ) : (
          food.source
        )}
      </td>

      <td>
        {isEditing ? (
          <>
            <button onClick={() => onSave(local)}>Save</button>
            <button onClick={onCancel}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={onEdit}>Edit</button>
            <button onClick={onDelete}>Delete</button>
          </>
        )}
      </td>
    </tr>
  );
}