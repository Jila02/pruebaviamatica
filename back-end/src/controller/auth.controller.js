import { pool } from "../db.js";
import bcrypt from "bcryptjs"
import { createAccessToken } from "../libs/jwt.js"
import Excel from 'excel4node';



export const selectUsers = async (req, res) => {
    try {
        const query = `
           select * from usuarios
           inner join persona on  usuarios.persona_idpersona = persona.id_persona
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const insertUsers = async (req, res) => {
    const { email, username, password, nombres, apellidos, identificacion, fecha_Nac } = req.body;
    let insertUserQuery, queryParams;

    try {
        let modifiedEmail=email;
        // Verificar si el correo electrónico ya está en uso
        const emailExist = await pool.query('SELECT * FROM usuarios WHERE mail = $1', [email]);
        if (emailExist.rows.length > 0) {
            const parts = email.split('@');
            const usernameBeforeAt = parts[0];
            modifiedEmail = `${usernameBeforeAt}1@${parts[1]}`;
        }

        const usernameExist = await pool.query('SELECT * FROM usuarios WHERE "userName" = $1', [username]);
        if (usernameExist.rows.length > 0) {
            return res.status(400).json({ message: "Username already in use" });
        }
        
        //VALIDACIONES
        if (!isValidUsername(username)) {
            return res.status(400).json({ message: "Invalid username format" });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({ message: "Invalid password" });
        }

        if (!isValidIdentification(identificacion)) {
            return res.status(400).json({ message: "Invalid identification number" });
        }



        const id_final = await pool.query('SELECT MAX("idusuario") as max_id FROM usuarios');
        let ultimaId = id_final.rows[0].max_id == null ? 1 : id_final.rows[0].max_id + 1;

        // Encriptar la contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        if (modifiedEmail) {
            insertUserQuery = `
                INSERT INTO usuarios("idUsuario", "userName", password, mail, "persona_idpersona", "sessionActive", status)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`;
            queryParams = [ultimaId, username, passwordHash, modifiedEmail, ultimaId, true, 'activo'];
        } else {
            insertUserQuery = `
                INSERT INTO usuarios("idUsuario", "userName", password, mail, "persona_idPersona", "sessionActive", status)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`;
            queryParams = [ultimaId, username, passwordHash, email, ultimaId, true, 'activo'];
        }
        const { rows } = await pool.query(insertUserQuery, queryParams);

        const id_final2 = await pool.query('SELECT MAX(id_persona) as max_id FROM persona');
        let ultimaId2 = id_final2.rows[0].max_id == null ? 1 : id_final2.rows[0].max_id + 1;

        // Insertar nueva persona en la tabla persona
        const insertPersonaQuery = `
            INSERT INTO persona(id_persona, nombres, apellidos, identificacion, "fechaNacimiento")
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`; 
        const { rows: rows2 } = await pool.query(insertPersonaQuery, [ultimaId2, nombres, apellidos, identificacion, fecha_Nac]);

        return res.json(rows[0]);
    } catch (error) {
        console.log(error)
        console.error('Error inserting user:', error);
        return res.status(500).json({ message: "Internal Server Error" });
    }


};

export const updateUser = async (req, res) => {
    const { idUsuario, email, username, password, nombres, apellidos, identificacion, fecha_Nac } = req.body;

    try {
        // Verificar si el nombre de usuario ya está en uso por otro usuario
        const usernameExist = await pool.query('SELECT * FROM usuarios WHERE "userName" = $1 AND "idUsuario" != $2', [username, idUsuario]);
        if (usernameExist.rows.length > 0) {
            return res.status(400).json({ message: "Username already in use by another user" });
        }

        // Validaciones
        if (!isValidUsername(username)) {
            return res.status(400).json({ message: "Invalid username format" });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({ message: "Invalid password" });
        }

        if (!isValidIdentification(identificacion)) {
            return res.status(400).json({ message: "Invalid identification number" });
        }

        // Encriptar la contraseña si es que se ha proporcionado una nueva
        let passwordHash;
        if (password) {
            passwordHash = await bcrypt.hash(password, 10);
        }

        // Actualizar usuario en la tabla usuarios
        const updateUserQuery = `
            UPDATE usuarios
            SET "userName" = $1, password = $2, mail = $3, "sessionActive" = $4, status = $5
            WHERE "idUsuario" = $6
            RETURNING *`;
        const userParams = [username, passwordHash || userResult.rows[0].password, email, true, 'activo', idUsuario];
        const { rows: updatedUser } = await pool.query(updateUserQuery, userParams);

        // Actualizar persona en la tabla persona
        const updatePersonaQuery = `
            UPDATE persona
            SET nombres = $1, apellidos = $2, identificacion = $3, "fechaNacimiento" = $4
            WHERE id_persona = $5
            RETURNING *`;
        const { rows: updatedPersona } = await pool.query(updatePersonaQuery, [nombres, apellidos, identificacion, fecha_Nac, idUsuario]);

        return res.json({
            user: updatedUser[0],
            persona: updatedPersona[0]
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


export const deleteUser= async(req,res)=>{
const {id_user}=req.body
        try {
            const query = 'UPDATE usuarios SET status = $1 WHERE "idUsuario" = $2';
            const result = await pool.query(query, ['eliminado', id_user]);
            res.json({ message: 'User status updated to Eliminado successfully' });

        } catch (error) {
            console.log(error)
        }

    }
export const inserRolUsuario= async(req,res)=>{
    const {id_user, id_rol}=req.body
    
    try {
        const query = `
        INSERT INTO rol_usuarios("rol_idrol", "usuario_idusuario")
        VALUES ($1, $2)
        RETURNING *;
      `;
      const values = [id_rol, id_user];
      const result = await pool.query(query, values);
      res.status(201).json(result.rows[0]); // Devuelve el primer resultado insertado

    } catch (error) {
        console.log(error)
    }
}

export const getRoluser= async(req,res)=>{
    try {
        const query =  `SELECT * FROM rol_usuarios `
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.log(error)
    }
}




export const insertRol= async(req,res)=>{
    const {idRol,Rolname}=req.body
    try {
        const query = `
        INSERT INTO "Rol"("idRol", "Rolname")
        VALUES ($1, $2)
        RETURNING *;
      `;     
      const values = [idRol,Rolname];
      const result = await pool.query(query, values);
      res.status(201).json(result.rows[0]); // Devuelve el primer resultado insertado

    } catch (error) {
        console.log(error)
    }
}


export const getRol= async(req,res)=>{
    try {
        const query =  ` SELECT * select * from "Rol" `
        const { rows } = await pool.query(query);
        res.json(rows);

    } catch (error) {
        console.log(error)
    }
}
   

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE mail=$1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "User not found" });
        }

        const { idUsuario, intentos,status } = result.rows[0];

        if (status === 'bloqueado') {
            return res.status(403).json({ message: "User is blocked" });
        }
        const userFound = result.rows[0];
        
        const isMatch= await bcrypt.compare(password,userFound.password);
        if (!isMatch) {

            const newFailedAttempts = intentos + 1;
            await pool.query('UPDATE usuarios SET intentos=$1 WHERE "idUsuario"=$2', [newFailedAttempts, idUsuario]);
            if (newFailedAttempts >= 3) {
                await pool.query('UPDATE usuarios SET status=$1 WHERE "idUsuario"=$2', ['bloqueado', idUsuario]);
                return res.status(403).json({ message: "User is blocked due to too many failed login attempts" });
            }

            return res.status(400).json({ message: "Incorrect password" });
        }
        const rolesQuery=`select r.idRol, r.rolname as rol_nombre
            from rol_usuarios ru
            inner join "Rol" r on ru.rol_idrol = r.idRol
            where ru.usuario_idusuario=$1`
        const rolesResult= await pool.query(rolesQuery,[idUsuario])

        const isAdmin = rolesResult.rows.some(role => role.idrol === 2);

        const sessionQuery = `
        INSERT INTO public.sessions(fechaingreso, usuarios_idusuario)
        VALUES (NOW(), $1)
        RETURNING *;`;

        const  sessionResult = await pool.query(sessionQuery, [idUsuario]);

        console.log(isAdmin)
        console.log("Creating token");
        const token = await createAccessToken({ id: userFound._id });

        // res.cookie("token", token);
        res.json({
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            createdAt: userFound.created_at,
            admin: isAdmin,
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const logout = async (req, res) => {
    const { userId } = req.body;
    try {
        const updateSessionQuery = `
            UPDATE public.sessions
            SET fechacierre = NOW()
            WHERE usuarios_idusuario = $1 AND fechacierre IS NULL;`;
        await pool.query(updateSessionQuery, [userId]);
        res.json({ message: "Logout successful" });
    } catch (error) {
        console.log(error)
    }
}

export const excel = async (req, res) => {
    const wb = new Excel.Workbook();
    const ws = wb.addWorksheet('Usuarios');

    try {
        const query = `
           select * from usuarios
           inner join persona on  usuarios.persona_idpersona = persona.id_persona
        `;
        const { rows } = await pool.query(query);

        // Definir encabezados
        const headings = [
            'ID',
            'Username',
            'Email',
            'Nombres',
            'Apellidos',
            'Identificación',
            'Fecha de Nacimiento'
        ];

        let column = 1;
        headings.forEach((heading, index) => {
            ws.cell(1, column).string(heading);
            column++;
        });

        let row = 2;
        rows.forEach(user => {
            ws.cell(row, 1).number(user.idUsuario); // ID
            ws.cell(row, 2).string(user.userName); // Username
            ws.cell(row, 3).string(user.mail); // Email
            ws.cell(row, 4).string(user.nombres); // Nombres
            ws.cell(row, 5).string(user.apellidos); // Apellidos
            ws.cell(row, 6).string(user.identificacion); // Identificación
            ws.cell(row, 7).date(new Date(user.fechaNacimiento)); // Fecha de Nacimiento
            row++;
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=usuarios.xlsx');

        wb.writeToBuffer().then(buffer => {
            res.send(buffer);
        });

    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const auditoria = async (req, res) => {
    try {
        const query = `
            SELECT u.idUsuario, u.username, u.mail, u.status, u.intentos,s.fechaingreso, s.fechacierre
            FROM usuarios u
            INNER JOIN sessions s ON u.idUsuario = s.usuarios_idusuario;
        `;

        const { rows } = await pool.query(query);

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error en la consulta de auditoría:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};



//VALIDACIONES

function isValidPassword(password) {
    if (password.length < 8) {
        return false;
    }
    if (!/[A-Z]/.test(password)) {
        return false;
    }
    if (/\s/.test(password)) {
        return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return false;
    }
    return true;
}

function isValidIdentification(identificacion) {
    if (!/^\d{10}$/.test(identificacion)) {
        return false;
    }

    if (/(\d)\1{3}/.test(identificacion)) {
        return false;
    }

    return true;
}

function isValidUsername(username) {
    if (username.length < 8 || username.length > 20) {
        return false;
    }

    if (/[\W_]/.test(username)) {
        return false;
    }

    if (!/\d/.test(username)) {
        return false;
    }

    if (!/[A-Z]/.test(username)) {
        return false;
    }


    return true;
}
