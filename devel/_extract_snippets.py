import numpy as np

def extract_snippets(data,*,times,snippet_size):
    M = data.shape[1]
    T = snippet_size
    L = len(times)
    Tmid = int(np.floor(T / 2))
    snippets = np.zeros((L, T, M),dtype='float32')
    for j in range(L):
        t1 = times[j] - Tmid
        t2 = t1+snippet_size
        snippets[j, :, :] = data[t1:t2, :]
    return snippets