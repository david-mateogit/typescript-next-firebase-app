import { useState } from "react";
import { useRouter } from "next/router";
import { firebase } from "src/initFirebase";
import { sanitize } from "tools/sanitize";

const db = firebase.database();

export default function Home(): JSX.Element {
  const [player1, setPlayer1] = useState("Player 1");
  const [player2, setPlayer2] = useState("Player 2");

  const router = useRouter();


  return (
    <main>
      <form onSubmit={(e): void => {
        e.preventDefault();
        const gamesRef = db.ref("games");
        gamesRef.remove();
        const newGameRef = gamesRef.push();
        newGameRef.set({
          player1: `${player1.trim()}`,
          player2: `${player2.trim()}`,
          turn: "player1",
          first: "player1",
          board: [
            ["", "", ""],
            ["", "", ""],
            ["", "", ""],
          ],

        });
        router.push(`/games/${newGameRef.key}`);
      }}>
        <h1>Tic Tac Toe</h1>
        <input
          name="player1"
          value={player1}
          maxLength={20}
          onChange={(e): void => setPlayer1(sanitize(e.target.value))} />
        <input
          name="player2"
          value={player2}
          maxLength={20}
          onChange={(e): void => setPlayer2(sanitize(e.target.value))} />

        <button type="submit">Let's Play!</button>
      </form>
    </main>
  );
}
