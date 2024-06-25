import { Request, Response } from "express"
import { comparePasswords, hashPassword } from "../services/password.services"
import prisma from "../models/user"
import { generateToken } from "../services/auth.services"

export const register = async(req: Request, res: Response): Promise<void> => {
  
  const { email, password } = req.body

  try {

    if(!email) {
      res.status(400).json({ error: 'El correo es obligatorio'})
      return
    }

    if(!password){
      res.status(400).json({ error: 'La contraseña es obligatoria'})
      return
    }

    const hashedPassword = await hashPassword(password)
    console.log(hashedPassword);
    
    const user = await prisma.create({
      data:{
        email,
        password: hashedPassword
      }
    })

    const token = generateToken(user)
    res.status(201).json({ token })

  } catch (error: any) {

    //To Do mejorar los errores

    if(error?.code === 'P2002' && error?.meta?.target?.includes('email')){
      res.status(400).json({ message: 'El correo ya existe'})
    }

    console.log(error)
    res.status(500).json({ error: 'Hubo un error en el resgistro'})
  }
}


export const login = async(req: Request, res: Response): Promise<void> => {

  const { email, password } = req.body

  try {

    if(!email) {
      res.status(400).json({ error: 'El correo es obligatorio'})
      return
    }

    if(!password){
      res.status(400).json({ error: 'La contraseña es obligatoria'})
      return
    }

    const user = await prisma.findUnique({ where: {email} })
    if(!user) {
      res.status(400).json({ error: 'Usuario no encontrado'})
      return
    }

    const passwordMatch = await comparePasswords(password, user.password)
    if(!passwordMatch) {
      res.status(401).json({ error: 'Usuario y contraseñas no coinciden'})
      return
    }

    const token = generateToken(user)
    res.status(200).json({ token })

  } catch (error: any) {
    console.log('Error:', error)
    
  }
}