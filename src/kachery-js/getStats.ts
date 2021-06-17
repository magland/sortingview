import { ByteCount, isEqualTo, isOneOf, JSONObject, NodeId, optional, _validateObject } from "./types/kacheryTypes";
import KacheryDaemonNode from "./KacheryDaemonNode";

export interface NodeStatsInterface {
    nodeId: NodeId,
    totalBytesSent: ByteCount
    totalBytesReceived: ByteCount
    totalMessagesSent: number
    html?: string
}

export interface GetStatsOpts {
    format?: 'json' | 'html'
}
export const isGetStatsOpts = (x: any): x is GetStatsOpts => {
    return _validateObject(x, {
        format: optional(isOneOf([isEqualTo('json'), isEqualTo('html')]))
    })
}

export const getStats = (node: KacheryDaemonNode, o: GetStatsOpts): NodeStatsInterface => {
    const ret: NodeStatsInterface = {
        nodeId: node.nodeId(),
        totalBytesSent: node.stats().totalBytesSent(),
        totalBytesReceived: node.stats().totalBytesReceived(),
        totalMessagesSent: node.stats().totalMessagesSent()
    }
    const format = o.format || 'json'
    if (format === 'json') {
        return ret
    }
    else if (format === 'html') {
        return {
            ...ret,
            html: createJsonViewHtml(ret as any as JSONObject)
        }
    }
    else {
        /* istanbul ignore next */
        throw Error('Unexpected in getStats')
    }
}

const createJsonViewHtml = (x: JSONObject) => {
    return `
<!DOCTYPE HTML>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>kachery-daemon node stats</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jsonview@1.2.0/dist/jquery.jsonview.css" />
    <script type="text/javascript" src="http://code.jquery.com/jquery.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/jsonview@1.2.0/dist/jquery.jsonview.js"></script>
    <script type="text/javascript">
    var x = \`${JSON.stringify(x)}\`
    $(function() {
        $("#json").JSONView(x, {collapsed: true, nl2br: false});
    });
    console.info(JSON.parse(x))
    </script>
</head>
<body>
    <h2>Kachery-daemon node stats</h2>
    <div id="json"></div>
</body>
</html>
`
}