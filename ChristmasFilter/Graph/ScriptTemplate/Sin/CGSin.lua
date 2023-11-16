local CGSin = CGSin or {}
CGSin.__index = CGSin

function CGSin.new()
    local self = setmetatable({}, CGSin)
    self.inputs = {}
    return self
end

function CGSin:setInput(index, func)
    self.inputs[index] = func
end

function CGSin:getOutput(index)
    return math.sin(self.inputs[0]())
end

return CGSin
