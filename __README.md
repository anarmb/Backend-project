# Proyecto Backend con Node.js, Express y MongoDB Atlas

Servidor con Express utilizando una base de datos de MongoAtlas, con gestión de usuarios y roles, subida de imágenes a Cloudinary y control de datos sin duplicados.

---

## Tecnologías utilizadas
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- bcryptjs
- jsonwebtoken
- dotenv
- multer
- cloudinary
- nodemon

---

## Estructura del proyecto
src/
├── config/
│ ├── db.js
├── data/
│ ├── allposts.js
├── controllers/
│ ├── user.controller.js
│ └── post.controller.js
├── models/
│ ├── Post.model.js
│ └── User.model.js
├── middlewares/
│ ├── auth.js
│ └── upload-img.js
├── routes/
│ ├── user.routes.js
│ └── post.routes.js
├── seeds/
│ └── post.seed.js
── utils/
│ └── jwt.js
└── index.js
└── .env

---

## Modelos y relación
### Modelo User
- `name`: String, requerido  
- `username`: String, único, requerido  
- `email`: String, único, requerido
- `password`: String (encriptado con bcrypt), longitud mínima 10 caracteres. 
- `role`: String (`"user"` o `"admin"`, por defecto `"user"`)  
- `image`: String
-  `posts`: [Array de ObjectId, relación con otra colección]
-  `favorites`: [Array de ObjectId, relación con otra colección]
 Los datos en el array no se duplican.
---
### Modelo Post
- `title`: String, requerido 
- `content`: String, requerido 
- `image`: String, requerido 
- `author`: Relación con la otra colección, requerido.
- `likes`: 0 por defecto

---

## Roles y permisos
| Acción | User | Admin |
|--------|------|--------|
| Eliminar su cuenta | Sí | Sí 
| Eliminar cuenta ajena | No|  Sí
| Cambiar rol de otro usuario | No | Sí |

---

## Middlewares
### `auth.js`
- Verificar si el usuario está autenticado y si tiene el rol correspondiente para ejecutar las acciones requeridas en el proyecto.
### `upload-img.js`
- Gestiona la subida de imágenes a Cloudinary mediante Multer.
- Elimina la imagen correspondiente al borrar el usuario.

---

## Seed
Permite cargar datos iniciales a la colección de posts.

## API Endpoints
### Usuarios (`/api/v1/users`)
| Método | Endpoint | Middlewares | Descripción |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | `upload.single` | Registro con avatar en Cloudinary |
| **POST** | `/login` | - | Login y generación de JWT |
| **GET** | `/get` | `isAuth` | Obtener perfil del usuario logueado |
| **PATCH** | `/add-fav/:postId` | `isAuth` | Añadir post a favoritos |
| **PATCH** | `/upgrade/:userId` | `isAuth`, `isAdmin` | Ascender usuario a Admin |
| **DELETE** | `/delete/:id` | `isAuth` | Borrar cuenta (Dueño/Admin) e imagen |
### Posts (`/api/v1/posts`)
| Método | Endpoint | Middlewares | Descripción |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | - | Ver todos los posts |
| **GET** | `/:id` | - | Ver detalle de un post |
| **POST** | `/` | `isAuth`, `upload` | Crear post con imagen en Cloudinary |
| **DELETE** | `/:id` | `isAuth` | Borrar post y limpiar DB |

---

# Tests en Insomnia
1. **Registro:** Crear un usuario en `POST /users/register`.
2. **Login:** Hacer login y recibir Token en `POST /users/login`.
3. **Crear posts:** Usar el Token (Bearer) para subir un post en `POST /posts`.
4. **Seguridad (Admin):**
   * Intentar usar `PATCH /upgrade/:userId` con un usuario normal. Debe dar un error 403.
   * Cambiar el rol con un usuario admin a un usuario user. 
5. **Borrado:** Borra un post y un usuario (admin o user) y que desaparezcan las imágenes de Cloudinary.

---

## Autor
Desarrollado por anarmb 


