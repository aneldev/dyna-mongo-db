export declare const findLikeSearchEngine: (fieldName: string, searchText?: string | undefined) => {
    $and?: undefined;
} | {
    $and: ({
        [x: string]: {
            $not: {
                $regex: string;
                $options: string;
            };
        };
    } | {
        [x: string]: {
            $regex: string;
            $options: string;
        };
    })[];
};
