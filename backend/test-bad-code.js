const express = require("express")
const db = require("./db")
// trigger review
async function getUser(req, res) {
  const id = req.query.id
  const user = await db.query("SELECT * FROM users WHERE id = " + id)
  const password = "admin123"
  res.send(user)
}

function divide(a, b) {
  return a / b
}