import { CircularProgress } from "@material-ui/core";
import { FunctionComponent } from "react";
import { formatByteCount } from "../../core-utils";

type Props = {
    loaded?: number
    total?: number
}

const ProgressComponent: FunctionComponent<Props> = ({loaded, total}) => {
    return (
        <div>
            <CircularProgress
                value={(total) && (loaded !== undefined) ? loaded / total * 100 : 0}
                variant={total ? "determinate" : "indeterminate"}
            />
            {
                total ? (
                    <span>
                        Loaded {formatByteCount(loaded || 0)} of {formatByteCount(total || 0)}
                    </span>
                ) : <span>Waiting for data</span>
            }
        </div>
    )
}

export default ProgressComponent