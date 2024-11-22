import React, { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Card, CardContent, Typography, Grid2 } from "@mui/material";

function UserCard({ user }) {
  return (
    <Card style={{ margin: "10px", padding: "10px" }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {user.username}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          style={{ fontSize: "20px" }}
        >
          Score: {user.sum}
        </Typography>
      </CardContent>
    </Card>
  );
}

function DisplayResults({ usersAndScores, userWin }) {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    window.location.reload();
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{"Scores"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Grid2 container spacing={2} justifyContent="center">
              {usersAndScores.map((user, index) => (
                <Grid2 item key={index}>
                  <UserCard user={user} />
                </Grid2>
              ))}
            </Grid2>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DisplayResults;
