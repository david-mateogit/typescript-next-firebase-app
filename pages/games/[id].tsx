import Head from "next/head";
import { firebase } from "src/initFirebase";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";

const db = firebase.database();

interface Props {
  id: string;
}

type Row = [string, string, string]

interface Game {
  player1: string;
  player2: string;
  first: string;
  turn: string;
  board: [Row, Row, Row];

}

function checkWinner(game: Game): boolean {
    const { board } = game;

    const byRow = (): boolean =>
      [0, 1, 2].some(
        (i) =>
          board[i][0] !== "" &&
            board[i][0] === board[i][1] &&
            board[i][1] === board[i][2]
      );

    const byCol = (): boolean =>
      [0, 1, 2].some(
        (i) =>
        board[0][i] !== "" &&
          board[0][i] === board[1][i] &&
          board[1][i] === board[2][i]
      );

    const byDiag1 = (): boolean =>
      board[0][0] !== "" && board[0][0] === board[1][1] && board[1][1] === board[2][2];

    const byDiag2 = (): boolean =>
     board[0][2] !== "" && board[0][2] === board[1][1] && board[1][1] === board[2][0];

    return byRow() || byCol() || byDiag1() || byDiag2();
}

export default function Game({ id }: Props): JSX.Element {

  const [game, setGame] = useState<Game | undefined>(undefined);
  const winner = !!game && checkWinner(game);


  useEffect(() => {
    const ref = db.ref(`games/${id}`);
    ref.on("value", (snapshot) => {
      setGame(snapshot.val());
    });
    return (): void => ref.off();
  }, [id]);

  const saveMove = (rowIndex: number, colIndex: number): void => {
    if (!game) {
      return;
    }
    const copy = { ...game };
    copy.board[rowIndex][colIndex] = game.turn === game.first ? "X" : "O";
    copy.turn = copy.turn === "player1" ? "player2" : "player1";
    db.ref(`games/${id}`).set(copy);
  };

  const resetGame = (): void => {
    const copy = { ...game };
    copy.board = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
    copy.first = copy.first === "player1" ? "player2" : "player1";
    copy.turn = copy.first;
    db.ref(`games/${id}`).set(copy);

  };

  if (!game) return <div>Loading Game...</div>;

  return (
    <>
      <Head>
        <title>{`${game.player1} vs ${game.player2}`}</title>
      </Head>
      <main>
        {winner ? (
          <h2>{game.turn === "player1" ? game.player2 : game.player1} is the Winner</h2>
        ) : (
            <h2>{game.turn === "player1" ? `${game.player1}` : `${game.player2}`} 's turn</h2>
          )
        }
        <div className="board">
          {game.board.map((row, rowIndex) => (<div key={`row-${rowIndex}`} className="row">
            {row.map((col, colIndex) => (
              <div key={`${rowIndex}-${colIndex}`} className="square" onClick={(): void => {
                if (col === "" && !winner) {
                  saveMove(rowIndex, colIndex);
                }
              }}>{col}</div>
            ))}
          </div>))}
        </div>
        <button type="button" onClick={(): void => {
          resetGame();
          }}>Reset
        </button>

      </main>
    </>
  );
}


export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  return { props: { id: query.id } };
};
