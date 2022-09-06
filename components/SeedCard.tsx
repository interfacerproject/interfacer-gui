import React from 'react';
import Card from "./brickroom/Card";

const SeedCard = ({seed}:{seed:string}) => {
    const seedCardProps = {
        title: "Seed",
        description: "This is your seed. Store it in a safe place.",
    }
    return (
        <Card title={seedCardProps.title}>
            <p>{seedCardProps.description}</p>
            <p>{seed}</p>
        </Card>
    )
}
export default SeedCard;