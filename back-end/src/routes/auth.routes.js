import { Router } from "express";
import { auditoria, deleteUser, excel, getRol, getRoluser, inserRolUsuario, insertRol, insertUsers, login, logout, selectUsers, updateUser } from "../controller/auth.controller.js";


const router=Router()

//USER
router.get('/selectUser',selectUsers)
router.post('/insertUser',insertUsers)
router.post('/updateUser',updateUser)
router.post('/deleteUser',deleteUser)
//RolUser
router.post('/insertRolUser',inserRolUsuario)
router.get('/getRolUser',getRoluser)
//Rol
router.post('/insertRol',insertRol)
router.get('/getRol',getRol)
//login
router.post('/login',login)
//logout
router.post('/logout',logout)
//sessions
router.get('/getUserSession',auditoria)
router.get('/excel',excel)
export default router