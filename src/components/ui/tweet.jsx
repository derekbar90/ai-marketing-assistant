import { useTweetData } from "../../hooks/useTweetData"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

export const Tweet = ({ tweetId }) => {
    const { tweet, loading, error } = useTweetData(tweetId);

    if (loading) return <div className="w-full h-32">Loading...</div>;
    if (error) return <Card className="bg-red-100"><CardContent>Error: {error.message}</CardContent></Card>;

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
            </CardHeader>
            <CardContent>
                <p className="text-gray-700 mb-4">{tweet.content}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Date: {tweet.date.toLocaleString()}</span>
                </div>
            </CardContent>
        </Card>
    );
};